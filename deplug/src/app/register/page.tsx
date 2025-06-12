'use client';

import { useState } from 'react';
import {
  Input,
  Select,
  Upload,
  Button,
  Form,
  Space,
  Typography,
  message,
  Tabs,
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { registerUser } from '@/firebase/auth';
import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

type UserType = 'developer' | 'creative' | 'hiring_manager';
type ProjectInput = {
  image: File | null;
  link: string;
  description: string;
};

type FormState = {
  email: string;
  password: string;
  name: string;
  userType: 'developer' | 'creative' | 'hiring_manager';
  description: string;
  country: string;
  state: string;
  address: string;
  profilePicture: File | null;
  portfolioLink: string;
  yearsOfExperience: number;
  companies: string[];
  skills: string[];
  cvFile: File | null;
  projects: ProjectInput[];
};
export default function RegisterPage() {
  // const []
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'developer' as UserType,
    description: '',
    country: '',
    state: '',
    address: '',
    profilePicture: null as File | null,
    portfolioLink: '',
    yearsOfExperience: 0,
    companies: [''],
    skills: [''],
    cvFile: null as File | null,
    projects: [] as {
      image: File | null;
      link: string;
      description: string;
    }[],
  });

  const handleChange = <K extends keyof FormState>(name: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File, type: 'profile' | 'project' | 'cv', index = 0) => {
    if (type === 'profile') {
      setForm(prev => ({ ...prev, profilePicture: file }));
    } else if (type === 'cv') {
      setForm(prev => ({ ...prev, cvFile: file }));
    } else {
      const newProjects = [...form.projects];
      newProjects[index] = newProjects[index] || { image: null, link: '', description: '' };
      newProjects[index].image = file;
      setForm(prev => ({ ...prev, projects: newProjects }));
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, `${path}/${uuidv4()}`);
    const snap = await uploadBytes(storageRef, file);
    return await getDownloadURL(snap.ref);
  };

  const handleSubmit = async () => {
    try {
      const profilePictureUrl = form.profilePicture
        ? await uploadFile(form.profilePicture, 'profilePictures')
        : '';
      const cvUrl = form.cvFile ? await uploadFile(form.cvFile, 'cvs') : '';

      const projects = await Promise.all(
        form.projects.map(async proj => {
          const imageUrl = proj.image ? await uploadFile(proj.image, 'projects') : '';
          return { imageUrl, link: proj.link, description: proj.description };
        })
      );

      const {
      ...restForm
      } = form;

      await registerUser({
        ...restForm,
        profilePictureUrl,
        cvUrl,
        projects,
        companies: form.companies.filter(Boolean),
        skills: form.skills.filter(Boolean),
      });

      message.success('Registration successful!');
      router.replace("/login")
    } catch (e: unknown) {
      console.error(e);
      // message.error(e || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Title level={2}>Register</Title>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Tabs defaultActiveKey="1">
          {/* Personal Info */}
          <Tabs.TabPane tab="Personal Info" key="1">
            <Form.Item label="Email" required>
              <Input onChange={e => handleChange('email', e.target.value)} />
            </Form.Item>
            <Form.Item label="Full Name" required>
              <Input onChange={e => handleChange('name', e.target.value)} />
            </Form.Item>
            <Form.Item label="About You">
              <TextArea rows={3} onChange={e => handleChange('description', e.target.value)} />
            </Form.Item>
            <Form.Item label="Country">
              <Input onChange={e => handleChange('country', e.target.value)} />
            </Form.Item>
            <Form.Item label="State">
              <Input onChange={e => handleChange('state', e.target.value)} />
            </Form.Item>
            <Form.Item label="Residential Address">
              <Input onChange={e => handleChange('address', e.target.value)} />
            </Form.Item>
            <Form.Item label="Profile Picture">
              <Upload beforeUpload={file => { handleFileChange(file, 'profile'); return false; }} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
              </Upload>
            </Form.Item>
          </Tabs.TabPane>

          {/* Work Info */}
          <Tabs.TabPane tab="Work Info" key="2">
            <Form.Item label="User Type">
              <Select onChange={v => handleChange('userType', v)}>
                <Option value="developer">Developer</Option>
                <Option value="creative">Creative</Option>
                <Option value="hiring_manager">Hiring Manager</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Years of Experience">
              <Input
                type="number"
                onChange={e => handleChange('yearsOfExperience', parseInt(e.target.value))}
              />
            </Form.Item>
            <Form.Item label="Companies">
              <Space direction="vertical" style={{ width: '100%' }}>
                {form.companies.map((c, i) => (
                  <Input
                    key={i}
                    value={c}
                    onChange={e => {
                      const arr = [...form.companies];
                      arr[i] = e.target.value;
                      setForm(prev => ({ ...prev, companies: arr }));
                    }}
                  />
                ))}
                <Button onClick={() => setForm(prev => ({ ...prev, companies: [...prev.companies, ''] }))}>
                  <PlusOutlined /> Add Company
                </Button>
              </Space>
            </Form.Item>
            <Form.Item label="Skills">
              <Space direction="vertical" style={{ width: '100%' }}>
                {form.skills.map((s, i) => (
                  <Input
                    key={i}
                    value={s}
                    onChange={e => {
                      const arr = [...form.skills];
                      arr[i] = e.target.value;
                      setForm(prev => ({ ...prev, skills: arr }));
                    }}
                  />
                ))}
                <Button onClick={() => setForm(prev => ({ ...prev, skills: [...prev.skills, ''] }))}>
                  <PlusOutlined /> Add Skill
                </Button>
              </Space>
            </Form.Item>
          </Tabs.TabPane>

          {/* Projects Info */}
          <Tabs.TabPane tab="Projects Info" key="3">
            <Form.Item label="Portfolio Link">
              <Input onChange={e => handleChange('portfolioLink', e.target.value)} />
            </Form.Item>
            <Form.Item label="Upload CV (PDF)">
              <Upload
                beforeUpload={file => { handleFileChange(file, 'cv'); return false; }}
                showUploadList={false}
                accept=".pdf"
              >
                <Button icon={<UploadOutlined />}>Upload CV</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="Projects">
              {form.projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 16, padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
                  <Input
                    placeholder="Project Link"
                    style={{ marginBottom: 8 }}
                    onChange={e => {
                      const arr = [...form.projects];
                      arr[i] = { ...arr[i], link: e.target.value };
                      setForm(prev => ({ ...prev, projects: arr }));
                    }}
                  />
                  <TextArea
                    placeholder="Project Description"
                    rows={2}
                    style={{ marginBottom: 8 }}
                    onChange={e => {
                      const arr = [...form.projects];
                      arr[i] = { ...arr[i], description: e.target.value };
                      setForm(prev => ({ ...prev, projects: arr }));
                    }}
                  />
                  <Upload
                    beforeUpload={file => { handleFileChange(file, 'project', i); return false; }}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Upload Project Image</Button>
                  </Upload>
                </div>
              ))}
              <Button
                onClick={() =>
                  setForm(prev => ({
                    ...prev,
                    projects: [...prev.projects, { image: null, link: '', description: '' }],
                  }))
                }
                icon={<PlusOutlined />}
              >
                Add Project
              </Button>
            </Form.Item>
          </Tabs.TabPane>

          {/* Password */}
          <Tabs.TabPane tab="Password" key="4">
            <Form.Item label="Password" required>
              <Input.Password onChange={e => handleChange('password', e.target.value)} />
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>

        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
