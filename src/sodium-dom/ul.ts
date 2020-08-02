import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function ul(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function ul(...children: ReadonlyArray<NaNode>): NaElement;

export function ul(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("ul", p, c),
	);
}
