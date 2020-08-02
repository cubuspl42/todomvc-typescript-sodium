import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function h1(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function h1(...children: ReadonlyArray<NaNode>): NaElement;

export function h1(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("h1", p, c),
	);
}
