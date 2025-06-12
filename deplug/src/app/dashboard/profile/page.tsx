"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config"; // adjust as needed
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import {
  Card,
  Avatar,
  Typography,
  Descriptions,
  List,
  Tag,
  Image,
  Spin,
} from "antd";
import { motion } from "framer-motion";
import { RegisterData } from "@/firebase/auth";
type Project = {
  imageUrl: string;
  description: string;
  link: string;
};
const { Title, Paragraph, Link: AntLink } = Typography;

type Talent = RegisterData & { id: string; uid: string  };
const Profile = () => {
  const [userData, setUserData] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as RegisterData;
          setUserData({ ...data, uid: firebaseUser.uid, id: docSnap.id })
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (!userData) return;

    const trackView = async () => {
      const deviceId = localStorage.getItem("deviceId") || crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
      const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
      const viewsRef = collection(db, "users", userData.uid, "views");

      const q = query(
        viewsRef,
        where("deviceId", "==", deviceId),
        where("timestamp", ">", since)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(viewsRef, {
          deviceId,
          timestamp: Timestamp.now()
        });
      }
    };
    trackView();
  }, [userData]);

  useEffect(() => {
    const fetchViewCount = async () => {
      if (!userData) return;
      const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
      const viewsRef = collection(db, "users", userData.uid, "views");
      const q = query(viewsRef, where("timestamp", ">", since));
      const snap = await getDocs(q);
      setViewCount(snap.size);
    };
    fetchViewCount();
  }, [userData]);

  if (loading) return <Spin className="mt-10 block mx-auto" size="large" />;
  if (!userData) return <div>User not found.</div>;

  const {
    name,
    email,
    address,
    country,
    state,
    userType,
    yearsOfExperience,
    description,
    companies,
    projects,
    skills,
    portfolioLink,
    profilePictureUrl,
    cvUrl,
   
    // createdAt,
  } = userData;

  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto p-4"
    >
      <Card bordered={false}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Avatar size={100} src={profilePictureUrl} />
          <div>
            <Title level={3}>{name}</Title>
            <Paragraph type="secondary">{email}</Paragraph>
            <Paragraph>{description}</Paragraph>
            <AntLink href={cvUrl} target="_blank">
              View CV
            </AntLink>
          </div>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <Card title="Basic Information">
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Address">{address}</Descriptions.Item>
            <Descriptions.Item label="Country">{country}</Descriptions.Item>
            <Descriptions.Item label="State">{state}</Descriptions.Item>
            <Descriptions.Item label="User Type">{userType}</Descriptions.Item>
            <Descriptions.Item label="Experience">
              {yearsOfExperience} years
            </Descriptions.Item>
            {/* <Descriptions.Item label="Joined">
              {new Date(createdAt).toLocaleDateString()}
            </Descriptions.Item> */}
            <Descriptions.Item label="Portfolio">
              <AntLink href={portfolioLink} target="_blank">
                View Portfolio
              </AntLink>
            </Descriptions.Item>
            <Descriptions.Item label="Profile Views">
            {viewCount || 0}
          </Descriptions.Item>
          </Descriptions>
        </Card>
      </motion.div>

      {companies?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card title="Companies Worked With">
            <List
              dataSource={companies}
              renderItem={(item: string) => <List.Item className="px-2 sm:px-4">{item}</List.Item>}
            />
          </Card>
        </motion.div>
      )}

      {skills?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card title="Skills">
            <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, idx: number) => (
              <Tag key={idx} color="blue">
                {skill}
              </Tag>
            ))}
          </div>
          </Card>
        </motion.div>
      )}

      {projects?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card title="Projects">
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2  }}
              dataSource={projects}
              renderItem={(project: Project) => (
                <List.Item>
                  <Card
                  className="w-full"
                    cover={<Image alt="project" src={project.imageUrl} className="object-cover w-full max-h-[200px]" />}
                    hoverable
                  >
                    <Card.Meta
                      title={project.description}
                      description={
                        <AntLink href={project.link} target="_blank">
                          Visit Project
                        </AntLink>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;
