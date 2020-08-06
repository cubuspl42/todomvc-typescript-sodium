import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, CellOr } from "./utils";
import { Cell } from "sodiumjs";

export function h1(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function h1(children: ReadonlyArray<NaNode>): NaElement;

export function h1(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function h1(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function h1(
	arg0: NaElementProps | CellOr<ReadonlyArray<NaNode>>,
	arg1?: CellOr<ReadonlyArray<NaNode>>,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "h1");
}
