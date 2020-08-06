import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, NaElementChildren } from "./utils";
import { Cell } from "sodiumjs";

export function span(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function span(children: ReadonlyArray<NaNode>): NaElement;

export function span(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function span(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function span(props: NaElementProps, children: ReadonlyArray<NaNode | Cell<NaNode | null>>): NaElement;
export function span(children: ReadonlyArray<NaNode | Cell<NaNode | null>>): NaElement;

export function span(
	arg0: NaElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "span");
}
