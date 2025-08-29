import { GJK } from "./algorithm/GJK.js";
import { EPA } from "./algorithm/EPA.js";
import { visualizeContact } from "../../utility/helpers.js";


export function getContact(A, B) {
  if (!A.sphere.intersectsSphere(B.sphere)) return null;

  const simplex = GJK(A,B);
  if (simplex) {
    const contact = EPA(simplex,A,B);
    if (contact) visualizeContact(contact);     // Debugging Contact
    return contact
  }

  return null;
}