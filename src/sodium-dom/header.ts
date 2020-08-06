import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, CellOr } from "./utils";
import { Cell } from "sodiumjs";

export function header(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function header(children: ReadonlyArray<NaNode>): NaElement;

export function header(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function header(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function header(
	arg0: NaElementProps | CellOr<ReadonlyArray<NaNode>>,
	arg1?: CellOr<ReadonlyArray<NaNode>>,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "header");
}