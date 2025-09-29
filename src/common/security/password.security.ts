
import * as bcrypt from 'bcrypt';

export function hash(password: string, saltRound: number = 10): string {
    return bcrypt.hashSync(password, saltRound)
}
export function compare(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash)
}

