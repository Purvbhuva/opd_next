export type DummyUser = {
    id: string
    username: string
    password: string
    name: string
    role: 'ADMIN' | 'FRONT_DESK' | 'DOCTOR' | 'BILLING'
}

export const DUMMY_USERS: DummyUser[] = [
    {
        id: 'dummy-admin',
        username: 'admin',
        password: 'password123',
        name: 'System Administrator',
        role: 'ADMIN'
    },
    {
        id: 'dummy-reception',
        username: 'reception',
        password: 'password123',
        name: 'Front Desk User',
        role: 'FRONT_DESK'
    },
    {
        id: 'dummy-drsmith',
        username: 'drsmith',
        password: 'password123',
        name: 'Dr. John Smith',
        role: 'DOCTOR'
    },
    {
        id: 'dummy-billing',
        username: 'billing',
        password: 'password123',
        name: 'Billing Department',
        role: 'BILLING'
    }
]

export function findDummyUser(username: string, password: string) {
    return DUMMY_USERS.find(
        (user) => user.username === username && user.password === password
    )
}