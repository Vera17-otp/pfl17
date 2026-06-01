import React, { useState } from 'react';
import Container from '../components/ui/layout/Container';
import Grid from '../components/ui/layout/Grid';
import Stack from '../components/ui/layout/Stack';
import Text from '../components/ui/basic/Text';
import Button from '../components/ui/basic/Button';
import Avatar from '../components/ui/basic/Avatar';
import Card from '../components/ui/data-display/Card';
import Badge from '../components/ui/data-display/Badge';
import List from '../components/ui/data-display/List';
import Table from '../components/ui/data-display/Table';
import Input from '../components/ui/form/Input';
import Select from '../components/ui/form/Select';
import Checkbox from '../components/ui/form/Checkbox';
import Alert from '../components/ui/feedback/Alert';
import Spinner from '../components/ui/feedback/Spinner';
import PageHeader from '../components/ui/section/PageHeader';
import { FaHeart, FaSearch, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function ComponentLibrary() {
    const [checked, setChecked] = useState(true);

    return (
        <Container maxWidth="1200px" padding="32px">
            <PageHeader 
                title="Component Library" 
                subtitle="A showcase of the 15+ atomic components broken down for this project."
                style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #E2E8F0' }}
            />

            <Stack gap="48px">
                {/* 1. BASIC COMPONENTS */}
                <section>
                    <Text variant="h2" size="xl" weight="bold" style={{ marginBottom: '24px', color: 'var(--primary-color)' }}>
                        1. Basic Components
                    </Text>
                    <Grid columns={2} gap="24px">
                        <Card>
                            <Text variant="h3" size="md" weight="semibold">Buttons</Text>
                            <Stack direction="row" gap="16px" wrap="wrap" style={{ marginTop: '16px' }}>
                                <Button variant="primary">Primary</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="primary" size="sm">Small</Button>
                            </Stack>
                        </Card>
                        <Card>
                            <Text variant="h3" size="md" weight="semibold">Typography & Media</Text>
                            <Stack direction="row" gap="24px" align="center" style={{ marginTop: '16px' }}>
                                <div>
                                    <Text size="xl" weight="bold" style={{ margin: 0 }}>Heading</Text>
                                    <Text size="sm" color="#A0AEC0">Body text</Text>
                                </div>
                                <Avatar fallback="AB" size={48} />
                                <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" size={48} />
                            </Stack>
                        </Card>
                    </Grid>
                </section>

                {/* 2. LAYOUT COMPONENTS */}
                <section>
                    <Text variant="h2" size="xl" weight="bold" style={{ marginBottom: '24px', color: 'var(--primary-color)' }}>
                        2. Layout Components
                    </Text>
                    <Grid columns={2} gap="24px">
                        <Card>
                            <Text variant="h3" size="md" weight="semibold">Grid (2 Columns)</Text>
                            <Grid columns={2} gap="12px" style={{ marginTop: '16px' }}>
                                <div style={{ background: '#F3F2F7', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>Col 1</div>
                                <div style={{ background: '#F3F2F7', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>Col 2</div>
                            </Grid>
                        </Card>
                        <Card>
                            <Text variant="h3" size="md" weight="semibold">Stack (Vertical & Horizontal)</Text>
                            <Stack direction="row" gap="12px" style={{ marginTop: '16px' }}>
                                <div style={{ background: '#E5F0FF', width: '40px', height: '40px', borderRadius: '8px' }}></div>
                                <div style={{ background: '#E5F0FF', width: '40px', height: '40px', borderRadius: '8px' }}></div>
                                <div style={{ background: '#E5F0FF', width: '40px', height: '40px', borderRadius: '8px' }}></div>
                            </Stack>
                        </Card>
                    </Grid>
                </section>

                {/* 3. DATA DISPLAY COMPONENTS */}
                <section>
                    <Text variant="h2" size="xl" weight="bold" style={{ marginBottom: '24px', color: 'var(--primary-color)' }}>
                        3. Data Display Components
                    </Text>
                    <Grid columns={2} gap="24px">
                        <Card>
                            <Text variant="h3" size="md" weight="semibold">Badges / Status</Text>
                            <Stack direction="row" gap="12px" style={{ marginTop: '16px' }}>
                                <Badge variant="success"><FaCheck /> Success</Badge>
                                <Badge variant="warning">Pending</Badge>
                                <Badge variant="danger">Failed</Badge>
                                <Badge variant="info">Info</Badge>
                            </Stack>
                        </Card>
                        <Card>
                            <Text variant="h3" size="md" weight="semibold">List</Text>
                            <List 
                                style={{ marginTop: '16px' }}
                                items={['Item 1', 'Item 2', 'Item 3']} 
                                renderItem={(item) => (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                                        {item}
                                    </div>
                                )} 
                            />
                        </Card>
                    </Grid>
                    <Card style={{ marginTop: '24px' }}>
                        <Text variant="h3" size="md" weight="semibold" style={{ marginBottom: '16px' }}>Table</Text>
                        <Table 
                            headers={['ID', 'Name', 'Role']}
                            data={[{id: 1, name: 'John Doe', role: 'Admin'}, {id: 2, name: 'Jane Smith', role: 'Editor'}]}
                            renderRow={(item) => (
                                <>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td><Badge variant="info">{item.role}</Badge></td>
                                </>
                            )}
                        />
                    </Card>
                </section>

                {/* 4. FORM COMPONENTS */}
                <section>
                    <Text variant="h2" size="xl" weight="bold" style={{ marginBottom: '24px', color: 'var(--primary-color)' }}>
                        4. Form Components
                    </Text>
                    <Grid columns={3} gap="24px">
                        <Card>
                            <Text variant="h3" size="md" weight="semibold" style={{ marginBottom: '16px' }}>Input Field</Text>
                            <Input placeholder="Type here..." icon={<FaSearch />} />
                        </Card>
                        <Card>
                            <Text variant="h3" size="md" weight="semibold" style={{ marginBottom: '16px' }}>Select Dropdown</Text>
                            <Select options={[{label: 'Option 1', value: '1'}, {label: 'Option 2', value: '2'}]} />
                        </Card>
                        <Card>
                            <Text variant="h3" size="md" weight="semibold" style={{ marginBottom: '16px' }}>Checkbox</Text>
                            <Checkbox label="Accept terms" checked={checked} onChange={() => setChecked(!checked)} />
                        </Card>
                    </Grid>
                </section>

                {/* 5. FEEDBACK COMPONENTS */}
                <section>
                    <Text variant="h2" size="xl" weight="bold" style={{ marginBottom: '24px', color: 'var(--primary-color)' }}>
                        5. Feedback Components
                    </Text>
                    <Grid columns={2} gap="24px">
                        <Card>
                            <Text variant="h3" size="md" weight="semibold" style={{ marginBottom: '16px' }}>Alerts</Text>
                            <Alert variant="info" title="Information" message="This is a feedback alert component." />
                            <Alert variant="danger" title="Error" message="Something went wrong!" />
                        </Card>
                        <Card>
                            <Text variant="h3" size="md" weight="semibold" style={{ marginBottom: '16px' }}>Loading States</Text>
                            <Stack direction="row" gap="24px" align="center">
                                <Spinner size={32} color="var(--primary-color)" />
                                <Spinner size={24} color="#FF5B5B" />
                                <Button variant="primary" disabled style={{ opacity: 0.7 }}>
                                    <Spinner size={16} color="white" /> Loading
                                </Button>
                            </Stack>
                        </Card>
                    </Grid>
                </section>
                
                {/* 6. SECTION COMPONENTS */}
                <section>
                    <Text variant="h2" size="xl" weight="bold" style={{ marginBottom: '24px', color: 'var(--primary-color)' }}>
                        6. Section Components
                    </Text>
                    <Card style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--primary-color)', padding: '40px', color: 'white', textAlign: 'center' }}>
                            <Text variant="h2" size="xl" weight="bold" color="white" style={{ marginBottom: '16px' }}>Hero Section / Page Header Mock</Text>
                            <Text variant="p" size="md" color="rgba(255,255,255,0.8)" style={{ marginBottom: '24px' }}>This component aggregates basic elements to form a complete section.</Text>
                            <Button variant="secondary">Learn More</Button>
                        </div>
                    </Card>
                </section>
            </Stack>
        </Container>
    );
}
