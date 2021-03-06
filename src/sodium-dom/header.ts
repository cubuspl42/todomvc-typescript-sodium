import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren } from "./utils";
import { NaGenericElement } from "./genericElement";

export function header(props: NaElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function header(...children: ReadonlyArray<NaNode>): NaElement;

export function header(
	arg0: NaElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaGenericElement("header", p, c),
	);
}
