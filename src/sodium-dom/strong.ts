import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function strong(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function strong(...children: ReadonlyArray<NaNode>): NaElement;

export function strong(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("strong", p, c),
	);
}
