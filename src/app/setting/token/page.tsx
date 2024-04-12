"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Token } from "@/db/schema";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Trash, Copy } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogHeader } from "next/dist/client/components/react-dev-overlay/internal/components/Dialog";
import { Label } from "@/components/ui/label";

export default function Page() {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const openDelete = useCallback(() => {
    setOpenDeleteModal(true);
  }, []);

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "expireAt",
        header: "Expire At",
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
      },
      {
        header: "Action",
        size: 50,
        cell() {
          return (
            <>
              <Button variant={"ghost"} size="sm">
                <Copy className={"h-4 w-4"} />
              </Button>
              <Button variant={"ghost"} size={"sm"} onClick={openDelete}>
                <Trash className={"h-4 w-4 text-destructive"} />
              </Button>
            </>
          );
        },
      },
    ] satisfies ColumnDef<Omit<Token, "userId">>[];
  }, [openDelete]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Token Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={"pb-2 flex flex-row"}>
            <Input className={"mr-4 max-w-64"} placeholder={"filter"} />
            <Dialog>
              <DialogTrigger asChild>
                <Button>New</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Token</DialogTitle>
                </DialogHeader>
                <div>
                  <Label>Description</Label>
                  <Input />
                </div>
                <DialogFooter>
                  <DialogClose>
                    <Button variant={"outline"}>Close</Button>
                  </DialogClose>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable
            columns={columns}
            data={[
              {
                id: 12,
                description: "Description",
                createdAt: new Date(),
                expireAt: new Date(),
              },
            ]}
          />
        </CardContent>
      </Card>
      <Dialog
        open={openDeleteModal}
        onOpenChange={(open) => setOpenDeleteModal(open)}
      >
        <DialogContent>
          <DialogHeader>Delete</DialogHeader>
          <DialogDescription>where to delete the item?</DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>Close</Button>
            </DialogClose>
            <Button>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
