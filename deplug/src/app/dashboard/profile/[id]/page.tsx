'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { auth } from "@/firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  Input,
  Button,
  Upload,
  Avatar,
  Typography,
  message,
  Card,
  Divider,
  Tag,
  Space,
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RegisterData } from "@/firebase/auth";
import type { RcFile } from 'antd/es/upload/interface';
const { TextArea } = Input;
const { Title, Text, Link } = Typography;
type Talent = RegisterData & { id: string };
type EditableFields = keyof Pick<
  Talent,
  | "email"
  | "country"
  | "state"
  | "address"
  | "userType"
  | "yearsOfExperience"
  | "description"
>;
export default function ProfilePage() {
  const params = useParams();
  const viewedProfileId = params?.id as string;
  const editableFields: { label: string; key: EditableFields }[] = [
    { label: "Email", key: "email" },
    { label: "Country", key: "country" },
    { label: "State", key: "state" },
    { label: "Address", key: "address" },
    { label: "User Type", key: "userType" },
    { label: "Years of Experience", key: "yearsOfExperience" },
    { label: "Description", key: "description" },
  ];
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<Talent | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  const isOwnProfile = authUserId === viewedProfileId;
  type Project = {
    imageUrl: string;
    description: string;
    link: string;
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!viewedProfileId) return;

      if (user) {
        setAuthUserId(user.uid);

        const docRef = doc(db, "users", viewedProfileId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserData({ id: snap.id, ...snap.data() } as Talent);
        }

        if (user.uid !== viewedProfileId) {
          const deviceId = window.localStorage.getItem("deviceId") || crypto.randomUUID();
          window.localStorage.setItem("deviceId", deviceId);

          const viewsRef = collection(db, "users", viewedProfileId, "views");
          const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
          const q = query(
            viewsRef,
            where("viewerId", "==", user.uid),
            where("deviceId", "==", deviceId),
            where("timestamp", ">", since)
          );
          const snap = await getDocs(q);
          if (snap.empty) {
            await addDoc(viewsRef, {
              viewerId: user.uid,
              deviceId,
              timestamp: Timestamp.now(),
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [viewedProfileId]);

  useEffect(() => {
    const fetchViewCount = async () => {
      if (!viewedProfileId) return;
      const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
      const viewsRef = collection(db, "users", viewedProfileId, "views");
      const q = query(viewsRef, where("timestamp", ">", since));
      const snap = await getDocs(q);
      setViewCount(snap.size);
    };

    fetchViewCount();
  }, [viewedProfileId]);

  const handleImageChange = async ({ file }: { file: RcFile }) => {
    if (!file || !authUserId || !isOwnProfile) return;
    setUploading(true);
    const storageRef = ref(storage, `profiles/${authUserId}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const userRef = doc(db, "users", authUserId);
    await updateDoc(userRef, { profilePictureUrl: url });
    setUserData({
      ...userData,
      profilePictureUrl: url,
    } as Talent);
    setUploading(false);
  };

  const handleUpdate = async () => {
    if (!authUserId || !isOwnProfile) return;
    const userRef = doc(db, "users", authUserId);
    await updateDoc(userRef, {
      name: userData?.name || "",
      // phone: userData?.phone || "",
      bio: userData?.description || "",
      skills: userData?.skills || "",
    });
    message.success("Profile updated");
  };

  if (!userData) return <p>Loading profile...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto p-2 md:p-6"
    >
      <Card
        title={<Title level={3} className="text-[12px]">{userData.name}</Title>}
        extra={<Text type="secondary" className="text-[11px]">Views (24hr): {viewCount}</Text>}
      >
        <div className="flex flex-col items-center gap-3">
          <Avatar size={96} src={userData.profilePictureUrl || "/default-avatar.png"} />
          {isOwnProfile && (
            <Upload
              beforeUpload={() => false}
              showUploadList={false}
              customRequest={({ file }) => handleImageChange({ file: file as RcFile })}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploading}
              >
                Upload New Photo
              </Button>
            </Upload>
          )}
        </div>

        <Divider />

        <div className="space-y-2">
        {editableFields.map(({ label, key }) => (
  <div key={key}>
    <Text strong>{label}: </Text>
    {isOwnProfile ? (
      <Input
        className="mt-1"
        value={userData[key] ?? ""}
        onChange={(e) =>
          setUserData({ ...userData, [key]: e.target.value })
        }
      />
    ) : (
      <span>{userData[key]}</span>
    )}
  </div>
))}


  {/* <div>
    <Text strong>UID: </Text> <span>{userData.uid}</span>
  </div> */}
  {/* <div>
    <Text strong>Created At: </Text>{" "}
    <span>{new Date(userData.).toLocaleString()}</span>
  </div> */}
</div>


        <Divider />

        <Text strong>Skills:</Text>
        <Space wrap className="mb-2">
          {userData.skills?.map((skill: string, i: number) => (
            <Tag key={i} color="blue">{skill}</Tag>
          ))}
        </Space>
          <br />
        <Text strong>Companies:</Text>
        <Space wrap className="mb-2">
          {userData.companies?.map((company: string, i: number) => (
            <Tag key={i} color="green">{company}</Tag>
          ))}
        </Space>
          <br />
        <Text strong>Projects:</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {userData.projects?.map((proj: Project, i: number) => (
            <Card key={i} title={proj.description}>
              <Image src={proj.imageUrl} alt="Project" className="mb-2 w-full h-40 object-cover rounded" />
              <Link href={proj.link} target="_blank">View Project</Link>
            </Card>
          ))}
        </div>

        <div className="mb-4">
          <Text strong>CV:</Text>{" "}
          <Link href={userData.cvUrl} target="_blank">Download CV</Link>
        </div>

        <div className="mb-4">
          <Text strong>Portfolio:</Text>{" "}
          <Link href={userData.portfolioLink} target="_blank">Open Portfolio</Link>
        </div>

        {isOwnProfile && (
          <>
            <Divider />
            <Input
              value={userData.name || ""}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="mb-2"
              placeholder="Name"
            />
            <TextArea
              value={userData.description || ""}
              onChange={(e) => setUserData({ ...userData, description: e.target.value })}
              rows={3}
              placeholder="Bio"
              className="mb-2"
            />
            <Input
              value={userData.skills?.join(", ") || ""}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  skills: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              placeholder="Skills (comma-separated)"
              className="mb-2"
            />
            <Button type="primary" block onClick={handleUpdate}>
              Update Profile
            </Button>
          </>
        )}
      </Card>
    </motion.div>
  );
}
