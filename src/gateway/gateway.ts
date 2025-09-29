import { OnModuleInit, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { Role } from "src/common/Decorator/role.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { TokenService } from "src/common/service/token.service";
import { connectedUser, TypeUser } from "src/DB/models/User/user.model";
export interface IAuthSocket extends Socket {
    user: TypeUser
}

@WebSocketGateway({
    cors: {
        origin: "*"
    },
    namespace: "chat"
})
@Role(["user"])
@UseGuards(AuthGuard, RoleGuard)
export class RealtimeGateway implements OnModuleInit, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server
    constructor(private readonly tokenService: TokenService) { }

    onModuleInit() {
        this.server.on("connection", (socket: Socket) => {
            console.log(`client connected ${socket.id}`)
        })
    }

    destructAuthorization(client: Socket): string {
        return client.handshake.auth?.authorization || client.handshake.headers?.authorization
    }

    afterInit(server: Server) {
        console.log("chat start ")
    }

    async handleConnection(client: IAuthSocket): Promise<void> {
        try {

            console.log(`client connected ${client.id}`)
            const authorization = this.destructAuthorization(client)
            const token = authorization.split(" ")[1];
            const user = await this.tokenService.verify(token, { expiresIn: "1d", secret: process.env.JWT_SECRET })
            client["user"] = user
            connectedUser.set(user.id.toString(), client.id)

        } catch (error) {
            client.emit("exception", error.message || "fail to connect")
        }

    }

    handleDisconnect(client: IAuthSocket) {
        console.log(`client dis-connected `)
        connectedUser.delete(client["user"].id.toString())
        console.log(connectedUser)
    }

    
    @SubscribeMessage("sayHi")
    sayHi(@MessageBody() body: any, @ConnectedSocket() client: Socket): void {
        try {
            client.emit("sayHi", "nest to postman")
            this.server.emit("sayHi", "nest to postman") //emit to all clients
            console.log(client['user'])
        } catch (error) {
            client.emit('exception', error.message, error.stack || 'fail to sayHi')
        }
    }

    emitStockChanges(data: 
        {productId: Types.ObjectId | undefined, stock: number | undefined} |
        {productId: Types.ObjectId | undefined, stock: number | undefined} []
    ) : void{
        try {
            this.server.emit("stockChanges", data)
        } catch (error) {
            this.server.emit("exception", error.message || "fail")
        }
    }
}