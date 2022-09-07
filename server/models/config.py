from typing import Dict, List, Optional, Union

from prisma.enums import ParamType
from pydantic import BaseModel
from pydantic_yaml import YamlModel


class DetailedOptions(BaseModel):
    label: str
    value: str


class Param(BaseModel):
    type: ParamType
    default: str
    description: str
    required: bool = True
    options: List[Union[str, DetailedOptions]] = []


class Config(YamlModel):
    """
    Script request model
    """

    name: str
    id: str

    params: Dict[str, Param] = {}

    build_command: Optional[str]
    image: Optional[str]
