cmake_minimum_required(VERSION 3.13)
project(squircleview LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(COMMON_CPP_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../common/cpp)

add_library(
  squircleview
  SHARED
  ${COMMON_CPP_DIR}/SquircleGeometry.cpp
  src/main/cpp/SquircleGeometryJni.cpp
)

target_include_directories(squircleview PRIVATE ${COMMON_CPP_DIR})
target_compile_options(squircleview PRIVATE -O2 -Wall -Wextra -Werror)
