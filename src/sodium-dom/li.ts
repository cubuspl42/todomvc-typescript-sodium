import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, CellOr } from "./utils";
import { Cell } from "sodiumjs";

export function li(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function li(children: ReadonlyArray<NaNode>): NaElement;

export function li(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function li(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function li(
	arg0: NaElementProps | CellOr<ReadonlyArray<NaNode>>,
	arg1?: CellOr<ReadonlyArray<NaNode>>,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "li");
}
