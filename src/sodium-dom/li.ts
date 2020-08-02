import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function li(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function li(...children: ReadonlyArray<NaNode>): NaElement;

export function li(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("li", p, c),
	);
}
