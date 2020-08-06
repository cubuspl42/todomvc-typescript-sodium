import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, NaElementChildren } from "./utils";
import { Cell } from "sodiumjs";

export function footer(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function footer(children: ReadonlyArray<NaNode>): NaElement;

export function footer(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function footer(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function footer(props: NaElementProps, children: ReadonlyArray<NaNode | Cell<NaNode | null>>): NaElement;
export function footer(children: ReadonlyArray<NaNode | Cell<NaNode | null>>): NaElement;

export function footer(
	arg0: NaElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "footer");
}
