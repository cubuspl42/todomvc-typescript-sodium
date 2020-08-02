import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function section(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function section(...children: ReadonlyArray<NaNode>): NaElement;

export function section(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("section", p, c),
	);
}
