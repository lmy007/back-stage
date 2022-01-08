<template>
  <div>
    <!-- breadcrumb section -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理 </el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- main -->
    <el-card>
      <!-- alert header -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" show-icon type="warning"> </el-alert>
      <!-- Cascader goodCateSelect -->
      <el-form>
        <el-form-item label="选择商品分类:">
          <el-cascader v-model="selectedGoodCate" :options="goodCateList" :props="{ expandTrigger: 'hover', label: 'cat_name', children: 'children', value: 'cat_id' }" @change="handleChange"></el-cascader>
        </el-form-item>
      </el-form>

      <!-- Tab manyParams &&onlyParams -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isDisabled" @click="showAddParamsDialog">添加参数</el-button>
          <el-table :data="tableParamsData" style="width: 100%" border>
            <el-table-column type="expand">
              <template #default="scope">
                <el-tag closable @close="deleteParamsValue(scope.row, i)" v-for="(item, i) in scope.row.attr_vals" :key="i">{{ item }}</el-tag>
                <el-input class="input-new-tag" v-if="inputVisible" v-model="inputParamsValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditParamsDialog(scope.row)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-danger" @click="deleteParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- Tab OnlyParams -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isDisabled" @click="showAddParamsDialog">添加参数</el-button>
          <el-table :data="tableParamsData" style="width: 100%" border>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditParamsDialog(scope.row)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-danger" @click="deleteParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- addParams Dialog -->
    <el-dialog :title="'添加' + diaTitle" :visible.sync="addParamsDialog" width="50%" @close="addParamsDialogClose">
      <el-form :model="addParamsruleForm" :rules="addParamsruleFormRules" ref="addParamsruleFormRef" label-width="100px">
        <el-form-item :label="diaTitle" prop="attr_name">
          <el-input v-model="addParamsruleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialog = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- editParams Dialog -->
    <el-dialog :title="'编辑' + diaTitle" :visible.sync="editParamsDialog" width="50%" @close="editParamsDialogClose">
      <el-form :model="editParamsruleForm" :rules="editParamsruleFormRules" ref="editParamsruleFormRef" label-width="100px">
        <el-form-item :label="diaTitle" prop="attr_name">
          <el-input v-model="editParamsruleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialog = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'goodParams',
  data() {
    return {
      goodCateList: [],
      selectedGoodCate: [],
      activeTabName: 'many',
      inputVisible: false,
      inputParamsValue: '',
      tableParamsData: [],
      diaTitle: '',
      addParamsDialog: false,
      editParamsDialog: false,
      editParamsId: '',
      editParamsAtrrId: '',
      editParamsruleForm: {
        attr_name: ''
      },
      addParamsruleForm: {
        attr_name: ''
      },
      addParamsruleFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      editParamsruleFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isDisabled() {
      if (this.selectedGoodCate.length !== 3) {
        return true
      } else {
        return false
      }
    },
    cateId() {
      if (this.selectedGoodCate.length === 3) {
        return this.selectedGoodCate[2]
      }
      return null
    }
  },
  created() {
    this.getGoodCate()
  },
  methods: {
    async getGoodCate() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.goodCateList = res.data
    },
    // cascader selected option value
    handleChange() {
      this.getGoodParams()
    },
    //   TabClick trigger
    handleTabClick() {
      this.getGoodParams()
    },
    async getGoodParams() {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeTabName } })
      if (res.meta.status !== 200) {
        this.$message.info('获取参数列表失败')
      }
      this.tableParamsData = res.data

      this.tableParamsData.forEach((item) => {
        if (!item.attr_vals) {
          item.attr_val = []
        } else {
          item.attr_vals = item.attr_vals.split(',')
        }
      })
    },
    // ----------------------------------addParams---------------------------------------------------------------------
    showAddParamsDialog() {
      this.diaTitle = this.activeTabName === 'many' ? '动态参数' : '静态参数'
      this.addParamsDialog = true
    },
    addParams() {
      this.$refs.addParamsruleFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('未填写添加参数')
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addParamsruleForm.attr_name, attr_sel: this.activeTabName })
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.addParamsDialog = false
        this.getGoodParams()
      })
    },
    addParamsDialogClose() {
      this.$refs.addParamsruleFormRef.resetFields()
    },
    // ----------------------------------editParams---------------------------------------------------------------------
    async showEditParamsDialog(row) {
      const { data: res } = await this.$http.get(`categories/${row.cat_id}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message.info('获取分类名称失败')
      }
      this.diaTitle = this.activeTabName === 'many' ? '动态参数' : '静态参数'
      this.editParamsruleForm.attr_name = res.data.attr_name
      this.editParamsId = row.cat_id
      this.editParamsAtrrId = row.attr_id
      this.editParamsDialog = true
    },
    editParams() {
      this.$refs.editParamsruleFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.info('请输入参数')
        }
        const { data: res } = await this.$http.put(`categories/${this.editParamsId}/attributes/${this.editParamsAtrrId}`, { attr_name: this.editParamsruleForm.attr_name, attr_sel: this.activeTabName })
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败')
        }
        this.$message.success('编辑成功')
        this.getGoodParams()
        this.editParamsDialog = false
      })
    },
    editParamsDialogClose() {
      this.$refs.editParamsruleFormRef.resetFields()
    },
    // ----------------------------------deleteParams---------------------------------------------------------------------
    async deleteParams(row) {
      const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((error) => error)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消操作')
      }
      const { data: res } = await this.$http.delete(`categories/${row.cat_id}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodParams()
    },
    // ----------------------------------deleteParamsValue--------------------
    async deleteParamsValue(row, i) {
      row.attr_vals.splice(i, 1)
      this.editParamsValue(row, i)
    },
    // ----------------------------------addParamsValue--------------------
    handleInputConfirm(row) {
      console.log(this.inputParamsValue.trim())
      if (this.inputParamsValue.trim()) {
        row.attr_vals.push(this.inputParamsValue.trim())
        this.editParamsValue(row)
      }
      this.inputVisible = false
      this.inputParamsValue = ''
    },
    showInput(row) {
      this.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // edit ParamValue
    async editParamsValue(row) {
      const { data: res } = await this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    }
  }
}
</script>

<style lang="less" scope>
.el-form {
  margin-top: 15px;
}
.input-new-tag {
  width: 80px !important;
}
</style>
