import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Link from "next/link"
import { ReactElement, JSXElementConstructor, ReactFragment, Key, ReactPortal } from "react"
import { Button } from "../ui/button";
import { Eye, Trash } from "lucide-react"
import { Document } from "@/lib/supabase";
  
  
  export function DocumentsTable({documents, setDocuments}: any) {
    const handleDelete = async (id: any ) => {
      // send delete request to api and remove from documents
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })
      if (response.status === 200) {
        setDocuments(documents.filter((document: Document) => document.id !== id))
      }


    }

    return (
      <Table>
        <TableCaption>A list of your recent documents.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-h">
          {documents && documents.map((document: { id: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) => (
            <TableRow key={document.id?.toString()}>
              <TableCell className="font-medium">{document.id}</TableCell>
              <TableCell>{document.name}</TableCell>
              <TableCell className="text-right">
                <Link href={`/documents/${document.id}`}>
                    <Button className="mr-2" size="sm" variant={'outline'}>
                        <Eye className="=h-4 w-4" />
                    </Button>
                </Link>
                    <Button size="sm" variant={'destructive'} onClick={(e) => handleDelete(document.id)}>
                        <Trash className="=h-4 w-4"  />
                    </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  