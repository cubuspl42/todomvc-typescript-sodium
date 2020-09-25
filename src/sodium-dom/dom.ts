import { _Vertex, Cell, lambda1, lambda2, Operational, Stream, Transaction, Unit, Vertex } from "sodiumjs";
import { CellOr } from "./utils";
import { LazyGetter } from "lazy-get-decorator";
import { Key } from 'ts-keycode-enum';
import { NaNoopVertex, NaVertex } from "../sodium-collections/vertex";
import { eventSource } from "./eventSource";

interface NaMouseEvent {
	readonly target: NaElement | null;
}

export abstract class NaElement {
	static from(htmlElement: HTMLElement | null): NaElement | null {
		const htmlElement_ = htmlElement as any;
		return htmlElement_?._naElement ?? null;
	}

	abstract get vertex(): Vertex;

	abstract get htmlElement(): HTMLElement;

	@LazyGetter()
	get sKeyDown(): Stream<Key> {
		const element = this.htmlElement;
		return eventSource(element, "keydown").map((ev) => ev.keyCode as Key);
	}

	@LazyGetter()
	get sKeyUp(): Stream<Key> {
		const element = this.htmlElement;
		return eventSource(element, "keyup").map((ev) => ev.keyCode as Key);
	}

	@LazyGetter()
	get sDoubleClick(): Stream<Unit> {
		const element = this.htmlElement;
		return eventSource(element, "dblclick").map(() => Unit.UNIT);
	}

	@LazyGetter()
	get sClick(): Stream<NaMouseEvent> {
		const element = this.htmlElement;
		return eventSource(element, "click").map((ev) => ({
			target: NaElement.from(ev.target as HTMLElement),
		}));
	}

	private _newParent: NaElement | null = null;

	private _isRemovedFromParent = false;

	_addToParent(t: Transaction, p: NaElement): void {
		if (this._newParent !== null) {
			throw new Error("Element is already being (re)parented");
		}

		this.resetEnqueue(t);

		this._newParent = p;
	}

	_removeFromParent(t: Transaction, p: NaElement): void {
		const parent = this.cParent.sample();

		if (parent !== p) {
			throw new Error("Element is being removed from ");
		}

		if (this._isRemovedFromParent) {
			throw new Error("Element is already being detached");
		}

		this.resetEnqueue(t);

		this._isRemovedFromParent = true;
	}

	private resetEnqueue(t: Transaction): void {
		if (this._newParent === null && !this._isRemovedFromParent) {
			t.resetEnqueue(() => {
				console.log("Resetting element...");
				this._newParent = null;
				this._isRemovedFromParent = false;
			});
		}
	}

	// TODO?: parent = non-null from start for old elements (big loop)

	// Supported:
	// parent = null, added to X -> parent = X (added)
	// parent = X, removed from X -> parent = null (removed)
	// parent = X, removed from X, added to Y -> parent = Y (reparented)
	// parent = X, added to Y -> error

	//// ??
	//// parent = null, added to X [old], removed from X -> parent = null

	// Unsupported:
	// multiple adds [_attach]
	// multiple removes [_detach]
	// added when already in-tree (and not removed)
	// removed when not having parent [impossible?]
	// removed from non-parent [impossible in NaArray?]

	// Matrix:
	// parent: null	added: -	removed: -	OK (nothing happens)
	// parent: null	added: -	removed: R	ERROR (removed when not in-tree; impossible with proper NaArray?)
	// parent: null	added: A	removed: -	OK! (added)
	// parent: null	added: A	removed: R	ERROR (removed when not in-tree; impossible with proper NaArray?)
	// parent: P	added: -	removed: -	OK (nothing happens)
	// parent: P	added: -	removed: R	OK! (removed [assert: P == R; impossible with proper NaArray?])
	// parent: P	added: A	removed: -	ERROR! (added when already in-tree)
	// parent: P	added: A	removed: R	OK! (reparented [assert: P == R; impossible with proper NaArray?])

	@LazyGetter()
	get cParent(): Cell<NaElement | null> {
		return Cell.looped((cParent) => Stream.map2(
			this.sRemovedFromParent,
			this.sAddedToParent,
			lambda2((pr: NaElement | null, pa: NaElement | null) => {
				const parent = cParent.sample();

				if (pr !== null && pa != null) { // reparented
					return pa;
				} else if (pa !== null) { // added
					if (parent === null) {
						throw new Error("Element already has parent");
					}
					return pa;
				} else if (pr !== null) { // removed
					return null;
				}

				throw new Error("Unreachable");
			}, [cParent]),
		).hold(null));
	}

	@LazyGetter()
	get sChanged(): Stream<Unit> {
		return new Stream<Unit>();
	}

	@LazyGetter()
	get sAddedToParent(): Stream<NaElement> {
		return NaDOM.root!.sChanged
			.filter(() => this._newParent != null)
			.map(() => this._newParent!);
	}

	@LazyGetter()
	get sRemovedFromParent(): Stream<NaElement> {
		return NaDOM.root!.sChanged
			.filter(() => this._isRemovedFromParent != null)
			.map(() => {
				const parent = this.cParent.sample();
				if (parent === null) {
					throw new Error("");
				}
				return parent!;
			});
	}

	@LazyGetter()
	get cIsAttached(): Cell<boolean> {
		return this.cParent.flatMap((p) =>
			p?.cIsAttached ?? new Cell(false),
		);
	}

	private buildAttachedStream(p: (wasAttached: boolean, willBeAttached: boolean) => boolean) {
		const cIsAttached = this.cIsAttached;
		return Operational.value(cIsAttached)
			.filter(lambda1((willBeAttached) => {
				const wasAttached = cIsAttached.sample();
				return p(wasAttached, willBeAttached);
			}, [cIsAttached]))
			.mapTo(Unit.UNIT);
	}

	@LazyGetter()
	get sAttached(): Stream<Unit> {
		return this.buildAttachedStream(
			(wasAttached, willBeAttached) => !wasAttached && willBeAttached,
		);
	}

	@LazyGetter()
	get sDetached(): Stream<Unit> {
		return this.buildAttachedStream(
			(wasAttached, willBeAttached) => wasAttached && !willBeAttached,
		);
	}

	contains(element: NaElement): boolean {
		return this.htmlElement.contains(element.htmlElement);
	}
}

export class NaBodyElement extends NaElement {
	@LazyGetter()
	get htmlElement(): HTMLElement {
		return document.body;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return new NaNoopVertex();
	}
}

export type NaNode = NaElement | string;

export interface NaElementProps {
	readonly id?: string,
	readonly className?: CellOr<string>;
}

export class NaDOM {
	static _root: NaElement | null = null;

	static get root(): NaElement | null {
		return this._root;
	}

	@LazyGetter()
	static get body() {
		return new NaBodyElement();
	}

	static render(
		build: () => NaElement,
		container: HTMLElement,
	): void {
		if (this._root !== null) {
			throw new Error("There's already root element present");
		}
		Transaction.run(() => {
			const element = build();
			this._root = element;
			// TODO: Support "un-rendering"
			(element.vertex as _Vertex).incRefCount();
			container.prepend(element.htmlElement);
		});
	}
}
