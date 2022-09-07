import { Engine, ParamType, Param } from '../../api'

type ConfigParam = Pick<
    Param,
    'description' | 'default' | 'required' | 'options' | 'type'
>

export interface Config {
    id: string
    name: string

    engine: Engine
    engine_version: string

    params: { [key: string]: ConfigParam }
}
