import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function div(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function div(...children: ReadonlyArray<NaNode>): NaElement;

export function div(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("div", p, c),
	);
}
