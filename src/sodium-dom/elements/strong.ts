import { NaElement, NaElementProps, NaNode } from "../dom";
import { buildGenericElementWithChildrenC, NaElementChildren } from "../utils";
import { Cell } from "sodiumjs";
import { NaArray } from "../../sodium-collections/array";

export function strong(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function strong(children: ReadonlyArray<NaNode>): NaElement;

export function strong(props: NaElementProps, children: NaArray<NaNode>): NaElement;
export function strong(children: NaArray<NaNode>): NaElement;

export function strong(props: NaElementProps, children: ReadonlyArray<NaNode | Cell<NaNode>>): NaElement;
export function strong(children: ReadonlyArray<NaNode | Cell<NaNode>>): NaElement;

export function strong(
	arg0: NaElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildGenericElementWithChildrenC(arg0, arg1, "strong");
}
