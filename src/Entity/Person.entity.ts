import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export class Person {
    @PrimaryGeneratedColumn()
    PersonId: number;

    @Column({ length: 100, nullable: false })
    NombreCompleto: string;

    @Column({ type: "bigint", nullable: false })
    DNI: number;

    @Column({ length: 10, nullable: false })
    Estado: string;

    @Column({ nullable: false })
    FechaIngreso: Date;

    @Column({ nullable: false })
    EsPEP: boolean;

    @Column({ nullable: false })
    EsSujetoObligado: boolean;

    @CreateDateColumn()
    FechaCreacion: Date;
}
