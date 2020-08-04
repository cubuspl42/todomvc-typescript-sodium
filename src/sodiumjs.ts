import { Stream } from "sodiumjs";
import { Maps } from "./utils";

declare module "sodiumjs" {
	class Stream<A> {
		static mergeArray<A>(streams: ReadonlyArray<Stream<A>>): Stream<Map<number, A>>;

		static mergeSet<A>(streams: ReadonlySet<Stream<A>>): Stream<ReadonlySet<A>>;
	}
}

function _mergeArray<A>(sa: ReadonlyArray<Stream<A>>, fromInc: number, toExc: number): Stream<Map<number, A>> {
	if (toExc - fromInc === 0) {
		return new Stream<Map<number, A>>();
	} else if (toExc - fromInc === 1) {
		return sa[fromInc].map(a => new Map([[fromInc, a]]));
	} else {
		const pivot = Math.floor((fromInc + toExc) / 2);
		return _mergeArray(sa, fromInc, pivot).merge(_mergeArray(sa, pivot, toExc),
			(map1, map2) => Maps.union(map1, map2)
		);
	}
}

Stream.mergeArray = function <A>(streams: ReadonlyArray<Stream<A>>): Stream<Map<number, A>> {
	return _mergeArray(streams, 0, streams.length);
};

Stream.mergeSet = function <A>(streams: ReadonlySet<Stream<A>>): Stream<ReadonlySet<A>> {
	return Stream
		.mergeArray(Array.from(streams))
		.map((m) => new Set(m.values()));
};
