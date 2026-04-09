import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { api, withAssetVersion } from "../api/client";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", department: "", phone: "", bio: "" });
  const [avatar, setAvatar] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  const load = async () => {
    const { data } = await api.get("/profiles/me");
    setProfile(data.user);
    setForm({
      name: data.user.name || "",
      department: data.user.department || "",
      phone: data.user.phone || "",
      bio: data.user.bio || ""
    });
  };

  useEffect(() => {
    load().catch(() => setProfile(null));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch("/profiles/me", form);
      await load();
      await refreshUser();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const uploadAvatar = async (e) => {
    e.preventDefault();
    if (!avatar) return;

    const fd = new FormData();
    fd.append("avatar", avatar);

    try {
      const { data } = await api.post("/profiles/me/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (data?.user) {
        setProfile(data.user);
      }
      setAvatar(null);
      setAvatarVersion(Date.now());
      await load();
      await refreshUser();
      toast.success("Avatar uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Avatar upload failed");
    }
  };

  return (
    <DashboardLayout title="My Profile">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <img
              src={
                profile?.avatarUrl
                  ? withAssetVersion(profile.avatarUrl, avatarVersion)
                  : "https://placehold.co/100x100?text=Avatar"
              }
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover"
            />
            <div>
              <p className="font-bold">{profile?.name || "-"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">{profile?.email || "-"}</p>
              <p className="text-xs uppercase tracking-wide text-emerald-600">{profile?.role || "-"}</p>
            </div>
          </div>

          <form onSubmit={uploadAvatar} className="mt-4 space-y-2">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Upload avatar</button>
          </form>
        </div>

        <form onSubmit={saveProfile} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Edit Profile</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Name"
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              placeholder="Department"
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Phone"
            />
            <textarea
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 md:col-span-2"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Bio"
            />
          </div>

          <button className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">Save changes</button>
        </form>
      </section>
    </DashboardLayout>
  );
};

export default ProfilePage;
