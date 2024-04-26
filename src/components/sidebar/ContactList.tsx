"use client";
import { useEffect, useState } from "react";

import AddContactModal from "@/components/modals/AddContactModal";
import { ContactSkeleton } from "@/components/ui/Skeletons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Contact } from "@/lib/my-types";
import { getInitials } from "@/lib/helpers";
import { IoPersonAddSharp } from "react-icons/io5";

type ContactListProps = {
    onGetContacts: () => Promise<Contact[]>;
};

export default function ContactList({ onGetContacts }: ContactListProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [modalAddContactIsOpen, setModalAddContactIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchContacts() {
            const contactsData = await onGetContacts();
            setContacts(contactsData);
            setIsLoading(false);
        }

        fetchContacts();
    }, []);

    const handleAddContact = async () => {
        const updatedContacts = await onGetContacts();
        setContacts(updatedContacts);
    };

    return (
        <>
            <section className="rounded h-16 col-span-2 flex items-center justify-center bg-primary">
                <AddContactModal onAddContact={handleAddContact} />
            </section>

            {isLoading ? (
                <ContactSkeleton />
            ) : (
                <>
                    {contacts.length > 0 ? (
                        <ul>
                            {contacts.map((contact) => (
                                <li
                                    key={contact.id}
                                    className={`rounded h-20 col-span-2 grid grid-cols-6 grid-rows-2`}
                                >
                                    <div className="row-span-2 col-span-1 md:col-span-2 lg:col-span-1 place-content-center">
                                        <Avatar>
                                            <AvatarImage
                                                src={contact?.imageUrl}
                                            />
                                            <AvatarFallback>
                                                {getInitials(contact.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="col-span-5 row-span-2 flex flex-col justify-between md:col-span-4 lg:col-span-5">
                                        <p className="col-span-4 pt-2 truncate mt-1">
                                            {contact.name}
                                        </p>
                                        <p className="text-xs text-gray-400 col-span-4 truncate mb-5">
                                            {contact.username}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-white">
                            No contacts available
                        </p>
                    )}
                </>
            )}
        </>
    );
}
