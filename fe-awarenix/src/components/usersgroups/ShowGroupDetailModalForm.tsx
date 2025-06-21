          
import { useState, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useMediaQuery } from "react-responsive";
import { BiUser } from "react-icons/bi";

export default function ShowGroupDetailModalForm() {
  const isMobile = useMediaQuery({ maxWidth: 640 }); // sm breakpoint

  type User = { name: string; email: string; position: string };

  const [users, setUsers] = useState<User[]>([
    { name: "", email: "", position: "" },
  ]);

  useEffect(() => {
    const data = {
      name: "Marco Antonio",
      email: "marco@gmail.com",
      position: "Software Engineer"
    };
    setUsers([data]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Group Name */}
      <div>
        <Label>Group Name</Label>
        <Input
          placeholder="Team A"
          type="text"
          className="w-full text-sm sm:text-base h-10 px-3"
          readonly
        />
      </div>

      {/* User List */}
      {isMobile ? (
        // MOBILE: Collapse style
        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 p-4 space-y-4 bg-gray-50 dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold flex items-center gap-2 dark:text-gray-600 text-gray-500">
                  <BiUser />
                  User #{index + 1}
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Name"
                  value={user.name}
                  readonly
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={user.email}
                  readonly

                />
                <Input
                  placeholder="Position"
                  value={user.position}
                  readonly
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // DESKTOP: Table style
        <div className="overflow-x-auto">
          <Table className="min-w-[800px] dark:text-gray-600">
            <TableHeader>
              <TableRow>
                <TableCell isHeader 
                  className="
                        relative 
                        px-5 py-3 pr-6
                        text-center text-gray-500 text-sm 
                        cursor-pointer select-none"
                >#</TableCell>
                <TableCell isHeader className="
                        relative 
                        px-5 py-3 pr-6
                        text-center text-gray-500 text-sm 
                        cursor-pointer select-none
                ">User Name</TableCell>
                <TableCell isHeader
                className="
                        relative 
                        px-5 py-3 pr-6
                        text-center text-gray-500 text-sm 
                        cursor-pointer select-none
                      ">User Email</TableCell>
                <TableCell isHeader
                className="
                        relative 
                        px-5 py-3 pr-6
                        text-center text-gray-500 text-sm 
                        cursor-pointer select-none
                      ">User Position</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index} >
                  <TableCell className="pl-5 pb-4">{index + 1}</TableCell>
                  <TableCell className="px-2 pb-4">
                    <Input
                      placeholder="Name"
                      value={user.name}
                      className="text-sm h-9 w-full"
                      readonly
                    />
                  </TableCell>
                  <TableCell className="px-2 pb-4">
                    <Input
                      placeholder="Email"
                      value={user.email}
                      className="text-sm h-9 w-full"
                      readonly
                    />
                  </TableCell>
                  <TableCell className="px-2 pb-4">
                    <Input
                      placeholder="Position"
                      value={user.position}
                      className="text-sm h-9 w-full"
                      readonly
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}