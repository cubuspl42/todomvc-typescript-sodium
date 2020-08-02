import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function span(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function span(...children: ReadonlyArray<NaNode>): NaElement;

export function span(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("span", p, c),
	);
}
