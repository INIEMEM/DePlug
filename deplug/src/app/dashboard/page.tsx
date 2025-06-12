'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  Input,
  Row,
  Col,
  Card,
  Button,
  Typography,
  Tag,
  Image
} from "antd";
import { motion } from "framer-motion";
import { RegisterData } from "@/firebase/auth";

const { Title, Text } = Typography;
type Talent = RegisterData & { id: string };
export default function DashboardHome() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ skill: "", experience: "" });
  const [talents, setTalents] = useState<Talent[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const list: Talent[] = snapshot.docs.map(doc => {
          const data = doc.data() as RegisterData;
          return {
            id: doc.id,
            ...data,
          };
        });
        setTalents(list);
        setFilteredTalents(list);
      } catch (err) {
        console.error("Failed to fetch talents", err);
      }
    };
    fetchTalents();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const skill = filter.skill.toLowerCase();
    const experience = parseInt(filter.experience) || 0;

    const filtered = talents.filter(talent => {
      const matchesSearch = talent.name?.toLowerCase().includes(lowerSearch);
      const matchesSkill = skill
        ? talent.skills?.some((s: string) => s.toLowerCase().includes(skill))
        : true;
      const matchesExperience = experience
        ? talent.yearsOfExperience >= experience
        : true;
      return matchesSearch && matchesSkill && matchesExperience;
    });

    setFilteredTalents(filtered);
  }, [search, filter, talents]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4"
    >
      <Title level={1}>DePlug</Title>

      <Title level={3}>Find Talents</Title>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24}>
          <Input.Search
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            enterButton
          />
        </Col>
        <Col xs={12}>
          <Input
            placeholder="Filter by skill"
            value={filter.skill}
            onChange={(e) => setFilter({ ...filter, skill: e.target.value })}
          />
        </Col>
        <Col xs={12}>
          <Input
            placeholder="Min experience (years)"
            type="number"
            value={filter.experience}
            onChange={(e) =>
              setFilter({ ...filter, experience: e.target.value })
            }
          />
        </Col>
      </Row>
      <h1 className="my-2 text-[22px]">Talents</h1>
      <Row gutter={[16, 16]}>
        {filteredTalents.map((talent, i) => (
          <Col xs={24} sm={12} lg={8} key={i}>
            <Card
              hoverable
              cover={
                <Image
                  alt="profile"
                  src={talent.profilePictureUrl || "/default-avatar.png"}
                  className="h-60 w-full object-cover rounded-t-md"
                />
              }
              actions={[
                <Button
                    type="primary"
                    key="hire"
                    onClick={() => {
                      const email = talent.email;
                      const subject = encodeURIComponent("Opportunity to Work With Us");
                      const body = encodeURIComponent(
                        `Hi ${talent.name},\n\nI came across your profile and I'm interested in discussing a potential opportunity with you.\n\nBest regards,\n[Your Name]`
                      );
                      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                    }}
                  >
                    Hire
                  </Button>,
                <Button
                  key="view"
                  type="link"
                  onClick={() => router.push(`/dashboard/profile/${talent.id}`)}
                >
                  See More
                </Button>,
              ]}
            >
              <div className="mb-2">
                <h1 className="text-[20px] font-semibold">{talent.name}</h1>
                {/* <Text strong>Skills:</Text> */}
                <div className="mt-1 flex flex-wrap gap-1">
                  {talent.skills?.map((skill: string, index: number) => (
                    <Tag color="blue" key={index}>{skill}</Tag>
                  ))}
                </div>
              </div>
              <Text>
                {talent.yearsOfExperience} years
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
    </motion.div>
  );
}
