"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Mail, Phone } from "lucide-react";

import type { Contact, ContactFormValues } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContactForm } from "./contact-form";

interface ContactsTableProps {
  contacts: Contact[];
  isAdmin: boolean;
  onUpdate: (contactId: string, values: ContactFormValues) => Promise<Contact | null>;
  onDelete: (contactId: string) => Promise<boolean>;
}

export function ContactsTable({
  contacts,
  isAdmin,
  onUpdate,
  onDelete,
}: ContactsTableProps) {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(contactId: string) {
    setDeletingId(contactId);
    try {
      await onDelete(contactId);
    } catch {
      // Error handling could show a toast here
    } finally {
      setDeletingId(null);
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Noch keine Ansprechpartner vorhanden.
          {isAdmin && " Fuegen Sie den ersten Ansprechpartner hinzu."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Position</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead className="hidden md:table-cell">Telefon</TableHead>
              {isAdmin && (
                <TableHead className="w-[50px]">
                  <span className="sr-only">Aktionen</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {contact.position || "—"}
                </TableCell>
                <TableCell>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1.5 text-sm hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">
                      {contact.email}
                    </span>
                  </a>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      className="inline-flex items-center gap-1.5 text-sm hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={deletingId === contact.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Aktionen</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingContact(contact)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(contact.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Loeschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit contact dialog */}
      {editingContact && (
        <ContactForm
          open={!!editingContact}
          onOpenChange={(open) => {
            if (!open) setEditingContact(null);
          }}
          onSubmit={(values) => onUpdate(editingContact.id, values)}
          contact={editingContact}
        />
      )}
    </>
  );
}
