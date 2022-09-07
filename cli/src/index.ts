#!/usr/bin/env node

import { Command, program } from 'commander'

import { createScript } from '@commands/init'
import { deploy } from '@commands/deploy'
import { login } from '@commands/login'
import { logout } from '@commands/logout'
import { run } from '@commands/run'
import { remove } from '@commands/remove'
import { userinfo } from '@commands/userinfo'
import { list } from '@commands/list/list'
import { setupScript } from '@commands/setup'
import { chooseWorkspace } from '@commands/workspaces'
import { token } from '@commands/token'

program.name('village')

// mount commands
createScript(program)
login(program)
logout(program)
deploy(program)
run(program)
remove(program)
userinfo(program)
list(program)
setupScript(program)
chooseWorkspace(program)
token(program)

const decorate = (cmd: Command) => {
    if (cmd.commands.length > 0) {
        cmd.commands.forEach(decorate)
    } else {
        cmd.option('-d, --debug')
    }
}

decorate(program)

program.showHelpAfterError()

program.parse()
