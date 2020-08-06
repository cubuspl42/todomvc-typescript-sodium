import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, NaElementChildren } from "./utils";
import { Cell } from "sodiumjs";

export function div(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function div(children: ReadonlyArray<NaNode>): NaElement;

export function div(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function div(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function div(
	arg0: NaElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "div");
}
