import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function footer(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function footer(...children: ReadonlyArray<NaNode>): NaElement;

export function footer(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("footer", p, c),
	);
}
