import { Cell } from "sodiumjs";

export class Maps {
	static mapValues<K, V1, V2>(m: ReadonlyMap<K, V1>, f: (v1: V1) => V2): ReadonlyMap<K, V2> {
		return new Map(Array.from(m).map(([k, v]): [K, V2] => [k, f(v)]));
	}

	static filterValues<K, V>(m: ReadonlyMap<K, V>, f: (v: V) => boolean): ReadonlyMap<K, V> {
		return new Map(Array.from(m).filter(([k, v]): boolean => f(v)));
	}

	static fromArray<A>(array: ReadonlyArray<A>): Map<number, A> {
		return new Map(array.map((value, index) => [index, value]));
	}

	static union<K, V>(mapA: ReadonlyMap<K, V>, mapB: ReadonlyMap<K, V>) {
		return new Map([...mapA, ...mapB]);
	}
}

export class CellArrays {
	static filter<A>(array: ReadonlyArray<A>, predicate: (a: A) => Cell<boolean>): Cell<ReadonlyArray<A>> {
		return Cell
			.liftArray(array.map((a) => predicate(a).map((b): [A, boolean] => [a, b])))
			.map((array_) => array_.flatMap(([a, b]) => b ? [a] : []));
	}

	static every<A>(array: ReadonlyArray<A>, predicate: (a: A) => Cell<boolean>): Cell<boolean> {
		return Cell
			.liftArray(array.map(predicate))
			.map((array_) => array_.every((b) => b));
	}
}
