import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, CellOr } from "./utils";
import { Cell } from "sodiumjs";

export function ul(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function ul(children: ReadonlyArray<NaNode>): NaElement;

export function ul(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function ul(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function ul(
	arg0: NaElementProps | CellOr<ReadonlyArray<NaNode>>,
	arg1?: CellOr<ReadonlyArray<NaNode>>,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "ul");
}
