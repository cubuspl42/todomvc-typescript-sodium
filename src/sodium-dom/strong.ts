import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, NaElementChildren } from "./utils";
import { Cell } from "sodiumjs";

export function strong(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function strong(children: ReadonlyArray<NaNode>): NaElement;

export function strong(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function strong(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function strong(props: NaElementProps, children: ReadonlyArray<NaNode | Cell<NaNode | null>>): NaElement;
export function strong(children: ReadonlyArray<NaNode | Cell<NaNode | null>>): NaElement;

export function strong(
	arg0: NaElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "strong");
}
