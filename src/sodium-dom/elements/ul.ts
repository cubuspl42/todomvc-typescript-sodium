import { NaElement, NaElementProps, NaNode } from "../dom";
import { buildGenericElementWithChildrenC } from "../utils";
import { NaArray } from "../../sodium-collections/array";

export function ul(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function ul(children: ReadonlyArray<NaNode>): NaElement;

export function ul(props: NaElementProps, children: NaArray<NaNode>): NaElement;
export function ul(children: NaArray<NaNode>): NaElement;

export function ul(
	arg0: NaElementProps | ReadonlyArray<NaNode> | NaArray<NaNode>,
	arg1?: ReadonlyArray<NaNode> | NaArray<NaNode>,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "ul");
}
