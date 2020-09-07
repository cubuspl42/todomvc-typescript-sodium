import { Cell, CellLoop, lambda1, Operational, Stream, StreamLoop, Unit } from "sodiumjs";
import { CellArrays, Maps } from "../utils";
import { LazyGetter } from "lazy-get-decorator";

export class NaArrayChange<A> {
	readonly updates?: ReadonlyMap<number, A>;
	readonly swaps?: ReadonlyMap<number, number>;
	readonly inserts?: ReadonlyMap<number, ReadonlyArray<A>>;
	readonly deletes?: ReadonlySet<number>;

	constructor(props: {
		updates?: ReadonlyMap<number, A>,
		swaps?: ReadonlyMap<number, number>,
		inserts?: ReadonlyMap<number, ReadonlyArray<A>>,
		deletes?: ReadonlySet<number>,
	}) {
		this.updates = props.updates;
		this.swaps = props.swaps;
		this.inserts = props.inserts;
		this.deletes = props.deletes;
	}

	static update<A>(index: number, element: A): NaArrayChange<A> {
		return new NaArrayChange<A>({
			updates: new Map([[index, element]]),
		});
	}

	static swap<A>(sourceIndex: number, targetIndex: number): NaArrayChange<A> {
		return new NaArrayChange<A>({
			swaps: new Map([[sourceIndex, targetIndex]]),
		});
	}

	static insert<A>(index: number, elements: ReadonlyArray<A>): NaArrayChange<A> {
		return new NaArrayChange<A>({
			inserts: new Map([[index, elements]]),
		});
	}

	static delete<A>(index: number): NaArrayChange<A> {
		return new NaArrayChange<A>({
			deletes: new Set([index]),
		});
	}

	apply(a: ReadonlyArray<A>): ReadonlyArray<A> {
		const a2 = a.slice();

		this.updates?.forEach((element, index) => {
			a2[index] = element;
		});

		this.swaps?.forEach((targetIndex, sourceIndex) => {
			a2[targetIndex] = a2[sourceIndex];
		});

		const a3 = a2.flatMap(((value, i) =>
			(this.deletes?.has(i) ? [] : [value]).concat(this.inserts?.get(i) ?? [])),
		).concat(this.inserts?.get(a.length) ?? []);

		return a3;
	}

	map<B>(f: (a: A) => B): NaArrayChange<B> {
		return new NaArrayChange<B>({
			updates: this.updates !== undefined ?
				Maps.mapValues(this.updates, f) :
				undefined,
			swaps: this.swaps,
			inserts: this.inserts !== undefined ?
				Maps.mapValues(this.inserts, (arr) => arr.map(f)) :
				undefined,
			deletes: this.deletes,
		});
	}

	union(other: NaArrayChange<A>) {
		return new NaArrayChange({
			updates: Maps.union(this.updates ?? new Map(), other.updates ?? new Map()),
			swaps: Maps.union(this.swaps ?? new Map(), other.swaps ?? new Map()),
			inserts: Maps.union(this.inserts ?? new Map(), other.inserts ?? new Map()),
			deletes: new Set([...this.deletes ?? new Set(), ...other.deletes ?? new Set()]),
		});
	}
}

function range(n: number): ReadonlyArray<number> {
	return Array(n).fill(0).map((x, i) => i);
}

export class NaArray<A> {
	readonly cContent: Cell<ReadonlyArray<A>>;

	readonly sChange: Stream<NaArrayChange<A>>;

	constructor(
		initial: Cell<ReadonlyArray<A>>,
		sChange?: Stream<NaArrayChange<A>>,
	) {
		const sChange_ = sChange ?? new Stream<NaArrayChange<A>>();
		this.cContent = sChange_.accumLazy(
			initial.sampleLazy(),
			(c, a) => c.apply(a),
		);
		this.sChange = sChange_;
	}

	static create<A>(props: {
		sUpdate?: Stream<[number, A]>,
		sInsert?: Stream<[number, A]>,
		sAppend?: Stream<A>,
		sDelete?: Stream<number>,
		sClear?: Stream<Unit>,
	}): NaArray<A> {
		const self = new NaArrayLoop<A>();
		const sUpdate = props.sUpdate ?? new Stream();
		const sInsert = props.sInsert ?? new Stream();
		const sAppend = props.sAppend ?? new Stream();
		const sDelete = props.sDelete ?? new Stream();
		const sClear = props.sClear ?? new Stream();

		const sChange = sUpdate.map(([index, value]) => NaArrayChange.update(index, value))
			.orElse(sInsert.map(([index, value]) => NaArrayChange.insert(index, [value])))
			.orElse(sAppend.map((value) => NaArrayChange.insert(self.cLength.sample(), [value])))
			.orElse(sDelete.map((index) => NaArrayChange.delete(index)))
			.orElse(sClear.map(() => self.clearChange()));

		const self_ = new NaArray<A>(new Cell([]), sChange);

		self.loop(self_);

		return self_;
	}

	static hold<A>(
		initial: ReadonlyArray<A>,
		sChange?: Stream<NaArrayChange<A>>,
	): NaArray<A> {
		return new NaArray<A>(new Cell(initial), sChange);
	}

	static melt<A>(cells: ReadonlyArray<Cell<A>>): NaArray<A>;

	static melt<A>(cells: NaArray<Cell<A>>): NaArray<A>;

	static melt<A>(cells: ReadonlyArray<Cell<A>> | NaArray<Cell<A>>): NaArray<A> {
		if (cells instanceof Array) {
			const arrayCell = Cell.liftArray(cells as Array<Cell<A>>);
			return NaArray.hold(
				cells.map((c) => c.sample()),
				Operational.updates(arrayCell).map((newArray) => {
					const oldArray = arrayCell.sample();
					const entries = newArray.map((newValue, index): [number, A] => [index, newValue]);
					return new NaArrayChange<A>({
						updates: new Map(entries.filter(([index, newValue]) => {
							const oldValue = oldArray[index];
							return oldValue !== newValue;
						}))
					});
				})
			);
		} else {
			throw new Error("Unimplemented");
		}
	}

	static merge<A>(cells: NaArray<Stream<A>>): Stream<Map<number, A>>;

	static merge<A>(cells: ReadonlyArray<Stream<A>>): Stream<Map<number, A>>;

	static merge<A>(cells: NaArray<Stream<A>> | ReadonlyArray<Stream<A>>): Stream<Map<number, A>> {
		throw new Error("Unimplemented");
	}

	static switch<A>(cell: Cell<ReadonlyArray<A>>): NaArray<A> {
		const self = new NaArrayLoop<A>();
		const cLength = self.cLength;
		const sChange = Operational.updates(cell).map(lambda1((elements) => {
			const length = cLength.sample();
			const change = new NaArrayChange({
				deletes: new Set(range(length)),
				inserts: new Map([[0, elements]]),
			});
			return change;
		}, [cLength]));
		const self_ = new NaArray<A>(cell, sChange);
		self.loop(self_);
		return self_;
	}

	static accum<A, B>(
		stream: Stream<A>,
		initialArray: ReadonlyArray<B>,
		f: (a: A, frpArray: NaArray<B>) => NaArrayChange<B>,
	) {
		const frpArrayLoop = new NaArrayLoop<B>();
		const frpArray = NaArray.hold(
			initialArray,
			stream.map((a) => f(a, frpArrayLoop)),
		);
		frpArrayLoop.loop(frpArray);
		return frpArray;
	}

	@LazyGetter()
	get cLength(): Cell<number> {
		return this.cContent.map((arr) => arr.length).calmRefEq();
	}

	map<B>(f: (a: A) => B): NaArray<B> {
		const naArray = NaArray.hold(
			this.cContent.sample().map(f),
			this.sChange.map((c) => c.map(f)),
		);
		(naArray as any)._source = this;
		return naArray;
	}

	filterC(f: (a: A) => Cell<boolean>): NaArray<A> {
		// TODO: Optimize this
		// Emit minimal number of insert/delete changes
		const naArray = NaArray.switch(this.cContent.flatMap((elements) =>
			CellArrays.filter(elements, f)),
		);
		naArray.sChange.rename("filterC/sChange");
		return naArray;
	}

	filter(f: (a: A) => boolean): NaArray<A> {
		throw new Error("Unimplemented");
	}

	mergeMap<B>(f: (a: A) => Stream<B>): Stream<Map<number, B>> {
		return Cell.switchS(this.cContent.map(
			(a) => Stream.mergeArray(a.map(f)),
		));
	}

	meltMap<B>(f: (a: A) => Cell<B>): NaArray<B> {
		return NaArray.melt(this.map(f));
	}

	private liftContentArray(f: (a: A) => Cell<boolean>): Cell<ReadonlyArray<boolean>> {
		return this.cContent
			.flatMap((arr) => Cell.liftArray(arr.map((a) => f(a))))
	}

	count(f: (a: A) => Cell<boolean>): Cell<number> {
		return this.liftContentArray(f)
			.map((bools) => bools.filter(b => b).length);
	}

	every(f: (a: A) => Cell<boolean>): Cell<boolean> {
		return this.liftContentArray(f)
			.map((bools) => bools.every(b => b));
	}

	pushChange(elements: ReadonlyArray<A>): NaArrayChange<A> {
		const length = this.cLength.sample();
		return new NaArrayChange<A>({
			inserts: new Map([
				[length, elements],
			]),
		});
	}

	clearChange(): NaArrayChange<A> {
		const length = this.cLength.sample();
		return new NaArrayChange<A>({
			deletes: new Set(range(length)),
		});
	}
}


export class NaArrayLoop<A> extends NaArray<A> {
	private readonly initialLoop: CellLoop<ReadonlyArray<A>>;

	private readonly sChangeLoop: StreamLoop<NaArrayChange<A>>;

	constructor() {
		const initial = new CellLoop<ReadonlyArray<A>>();
		(initial as any).__name = "initial";
		const sChange = new StreamLoop<NaArrayChange<A>>();

		super(
			initial,
			sChange,
		);

		this.initialLoop = initial;
		this.sChangeLoop = sChange;
	}

	loop(frpArray: NaArray<A>) {
		this.initialLoop.loop(frpArray.cContent);
		this.sChangeLoop.loop(frpArray.sChange);
	}
}
