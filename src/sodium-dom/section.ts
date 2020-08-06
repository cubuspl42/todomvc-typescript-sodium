import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, CellOr } from "./utils";
import { Cell } from "sodiumjs";

export function section(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function section(children: ReadonlyArray<NaNode>): NaElement;

export function section(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function section(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function section(
	arg0: NaElementProps | CellOr<ReadonlyArray<NaNode>>,
	arg1?: CellOr<ReadonlyArray<NaNode>>,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "section");
}
