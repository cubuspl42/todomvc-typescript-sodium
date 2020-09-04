import { NaElement, NaElementProps, NaNode } from "../dom";
import { buildGenericElementWithChildrenC, NaElementChildren } from "../utils";
import { NaArray } from "../../sodium-collections/array";

export function h1(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function h1(children: ReadonlyArray<NaNode>): NaElement;

export function h1(props: NaElementProps, children: NaArray<NaNode>): NaElement;
export function h1(children: NaArray<NaNode>): NaElement;

export function h1(
	arg0: NaElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "h1");
}
