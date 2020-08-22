import { Cell, Stream, StreamSlot, Unit } from "sodiumjs";
import { LazyGetter } from "lazy-get-decorator";
import "./sodiumjs";
import { NaArray, NaArrayChange, NaArrayLoop } from "./sodium-collections/array";

export class Todo {
	constructor(
		sSetDoneAll: Stream<boolean>,
		text: string,
	) {
		this.sSetDoneAll = sSetDoneAll;
		this.text = this.sEdit.hold(text);
	}

	private readonly sSetDoneAll: Stream<boolean>;

	readonly text: Cell<string>;

	readonly sSetDone = new StreamSlot<boolean>();

	@LazyGetter()
	get cIsDone(): Cell<boolean> {
		return this.sSetDoneAll.orElse(this.sSetDone).hold(false);
	}

	readonly sDelete = new StreamSlot<Unit>();

	readonly sEdit = new StreamSlot<string>();
}

export class TodoList {
	private readonly _aTodos = new NaArrayLoop<Todo>();

	readonly sAddTodo = new StreamSlot<string>();

	readonly sToggleAll = new StreamSlot<Unit>()

	readonly sClearCompleted = new StreamSlot<Unit>();

	constructor() {
		const todo = (text: string) => new Todo(this.sSetDoneAll, text);

		const aTodos = this._aTodos;

		const sAdd = this.sAddTodo;

		const sRemove: Stream<Map<number, Unit>> =
			aTodos.mergeMap((t) => t.sDelete);

		const sAddChange = sAdd.map((name) => {
			return aTodos.pushChange([
				todo(name),
			]);
		});

		const sRemoveChange = sRemove.map((m) =>
			new NaArrayChange<Todo>({
				deletes: new Set(m.keys()),
			})
		).orElse(this.sClearCompleted.map(() =>
			new NaArrayChange<Todo>({
				deletes: new Set(
					aTodos.cContent.sample()
						.flatMap((todo, index) =>
							todo.cIsDone.sample() ? [index] : [],
						),
				),
			})),
		);

		const aTodos_: NaArray<Todo> = NaArray.hold(
			[
				todo("Buy milk"),
				todo("Buy carrots"),
			],
			sAddChange.merge(sRemoveChange,
				(a, r) => a.union(r),
			),
		);

		this._aTodos.loop(aTodos_);

		// this.aTodos.cContent.listen((todos) => console.log({ todos }));
	}

	@LazyGetter()
	get cAreAllTodosDone(): Cell<boolean> {
		return this.aTodos.every((todo) => todo.cIsDone).calmRefEq();
	}

	@LazyGetter()
	private get sSetDoneAll(): Stream<boolean> {
		return this.sToggleAll
			.snapshot1(this.cAreAllTodosDone)
			.map((b) => !b);
	}


	get aTodos(): NaArrayLoop<Todo> {
		return this._aTodos;
	}

	private buildFilteredTodos(predicate: (todo: Todo) => Cell<boolean>): NaArray<Todo> {
		return this.aTodos.filterC(predicate);
	}

	@LazyGetter()
	get aCompletedTodos(): NaArray<Todo> {
		return this.buildFilteredTodos((todo) => todo.cIsDone.map((d) => d));
	}

	@LazyGetter()
	get aUncompletedTodos(): NaArray<Todo> {
		return this.buildFilteredTodos((todo) => todo.cIsDone.map((d) => !d));
	}
}
