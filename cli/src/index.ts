#!/usr/bin/env node

import { deploy } from '@commands/deploy'
import { deploy_aws } from '@commands/deploy_aws'
import { createScript } from '@commands/init'
import { list } from '@commands/list/list'
import { login } from '@commands/login'
import { logout } from '@commands/logout'
import { remove } from '@commands/remove'
import { run } from '@commands/run'
import { run_aws } from '@commands/run_aws'
import { setupScript } from '@commands/setup'
import { token } from '@commands/token'
import { userinfo } from '@commands/userinfo'
import { chooseWorkspace } from '@commands/workspace'
import { Command, program } from 'commander'

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
run_aws(program)
deploy_aws(program)

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
