"use client";

import { useApp } from "@/lib/app-context";
import AccountForm from "@/components/AccountForm";
import { PageHeader } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/store";

export default function AccountPage() {
  const { currentUser, loaded } = useApp();
  if (!loaded) return null;
  if (!currentUser) return null;
  return (
    <div>
      <PageHeader title="Il mio profilo" subtitle={ROLE_LABEL[currentUser.role]} />
      <AccountForm mode="edit" userId={currentUser.id} />
    </div>
  );
}
