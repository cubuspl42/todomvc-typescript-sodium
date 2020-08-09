import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildGenericElementWithChildrenC, NaElementChildren } from "./utils";
import { NaArray } from "../sodium-collections/array";

export function header(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function header(children: ReadonlyArray<NaNode>): NaElement;

export function header(props: NaElementProps, children: NaArray<NaNode>): NaElement;
export function header(children: NaArray<NaNode>): NaElement;

export function header(
	arg0: NaElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "header");
}
