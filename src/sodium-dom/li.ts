import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, NaElementChildren } from "./utils";
import { NaArray } from "../sodium-collections/array";

export function li(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function li(children: ReadonlyArray<NaNode>): NaElement;

export function li(props: NaElementProps, children: NaArray<NaNode>): NaElement;
export function li(children: NaArray<NaNode>): NaElement;

export function li(
	arg0: NaElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "li");
}
