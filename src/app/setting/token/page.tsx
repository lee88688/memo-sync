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
} from "@/components/ui/dialog";
import { DialogHeader } from "next/dist/client/components/react-dev-overlay/internal/components/Dialog";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createToken,
  deleteToken,
  getTokenList,
} from "@/app/setting/token/actions";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";

export default function Page() {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openNewModal, setOpenNewModal] = useState(false);
  const [newTokenDescription, setNewTokenDescription] = useState("");
  const [currentDeleteId, setCurrentDeleteId] = useState<number>();

  const openDelete = useCallback((id: number) => {
    setCurrentDeleteId(id);
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
        accessorKey: "id",
        size: 50,
        cell(cell) {
          const { id, token } = cell.row.original;
          return (
            <>
              <Button
                variant={"ghost"}
                size="sm"
                onClick={() => {
                  navigator.clipboard
                    .writeText(token)
                    .then(() => toast("copied token successfully."));
                }}
              >
                <Copy className={"h-4 w-4"} />
              </Button>
              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={() => openDelete(id)}
              >
                <Trash className={"h-4 w-4 text-destructive"} />
              </Button>
            </>
          );
        },
      },
    ] satisfies ColumnDef<Omit<Token, "userId">>[];
  }, [openDelete]);

  const listQuery = useQuery({
    queryKey: ["tokenList"],
    queryFn: () => getTokenList().then((res) => res.data),
    initialData: [],
  });

  const createTokenMutation = useMutation({
    mutationFn: async () => {
      await createToken({ description: newTokenDescription });
      setOpenNewModal(false);
      return listQuery.refetch();
    },
  });

  const deleteTokenMutation = useMutation({
    mutationFn: async () => {
      if (!currentDeleteId) {
        return;
      }
      await deleteToken({ id: currentDeleteId });
      setOpenDeleteModal(false);
      return listQuery.refetch();
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Token Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={"pb-2 flex flex-row"}>
            <Input className={"mr-4 max-w-64"} placeholder={"filter"} />
            <Button onClick={() => setOpenNewModal(true)}>New</Button>
          </div>
          <DataTable columns={columns} data={listQuery.data} />
        </CardContent>
      </Card>
      <Dialog
        open={openNewModal}
        onOpenChange={(open) => setOpenNewModal(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Token</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Description</Label>
            <Input
              value={newTokenDescription}
              onChange={(e) => setNewTokenDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose>
              <LoadingButton
                variant={"outline"}
                loading={createTokenMutation.isPending}
              >
                Close
              </LoadingButton>
            </DialogClose>
            <LoadingButton
              loading={createTokenMutation.isPending}
              onClick={() => createTokenMutation.mutate()}
            >
              Save
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDeleteModal}
        onOpenChange={(open) => setOpenDeleteModal(open)}
      >
        <DialogContent>
          <DialogHeader>Delete</DialogHeader>
          <DialogDescription>where to delete the item?</DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <LoadingButton
                variant={"outline"}
                loading={deleteTokenMutation.isPending}
              >
                Close
              </LoadingButton>
            </DialogClose>
            <LoadingButton
              loading={deleteTokenMutation.isPending}
              onClick={() => deleteTokenMutation.mutate()}
            >
              Delete
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
