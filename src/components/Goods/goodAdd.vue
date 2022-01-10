<template>
  <div>
    <!-- breadcrumb section -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理 </el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!--alert bar  -->
      <el-alert title="添加商品信息" type="info" center show-icon> </el-alert>
      <!-- Step bar -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--Tab  -->
      <el-form :model="addGoodForm" :rules="addGoodFormrules" ref="addGoodFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeLeave" @tab-click="handleTabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item>
              <el-cascader v-model="selectedKey" :options="goodCateList" :props="{ expandTrigger: 'hover', label: 'cat_name', children: 'children', value: 'cat_id' }" @change="handleCascaderChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyParamsList" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="item2" v-for="(item2, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyParamsList" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-success="handleUploadSuccess" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="4">
            <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- pic preview dialog -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img class="preView" :src="picPath.url" alt="" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'goodAdd',
  data() {
    return {
      activeIndex: '0',
      goodCateList: [],
      selectedKey: [],
      addGoodForm: {
        goods_name: '',
        goods_cat: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      manyParamsList: [],
      onlyParamsList: [],
      addGoodFormrules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }]
      },
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      picPath: {},
      previewVisible: false
    }
  },
  created() {
    this.getGoodCate()
  },
  methods: {
    async getGoodCate() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      }
      this.goodCateList = res.data
      console.log(this.goodCateList)
    },
    handleCascaderChange() {
      if (this.selectedKey.length !== 3) {
        this.selectedKey = []
      }
    },
    beforeLeave(activeName, oldActiveName) {
      let isNext = true
      if (oldActiveName === '0') {
        this.$refs.addGoodFormRef.validate((valid) => {
          if (!valid || this.selectedKey.length !== 3) {
            this.$message.error('请先选择商品分类! 或 填写商品名称')
            isNext = false
          }
        })
        return isNext
      }
    },
    handleTabClick() {
      if (this.activeIndex === '1') {
        this.getManyParams()
      } else if (this.activeIndex === '2') {
        this.getOnlyParams()
      }
    },
    async getManyParams() {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })

      if (res.meta.status !== 200) {
        return this.$message.error('获取动态参数失败')
      }
      this.manyParamsList = res.data
      this.manyParamsList.forEach((item) => {
        item.attr_vals = item.attr_vals.split(' ')
      })
    },
    async getOnlyParams() {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })

      if (res.meta.status !== 200) {
        return this.$message.error('获取静态参数失败')
      }
      this.onlyParamsList = res.data
    },
    handleUploadSuccess(response) {
      if (response.meta.status !== 200) {
        this.$message.error('上传失败')
      }
      this.picPath = response.data
      this.addGoodForm.pics.push({ pic: this.picPath.tmp_path })
    },
    handlePreview() {
      this.previewVisible = true
    },
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addGoodForm.pics.findIndex((x) => {
        return x.pic === filePath
      })
      this.addGoodForm.pics.splice(i, 1)
    },
    async addGood() {
      this.addGoodForm.goods_cat = this.selectedKey.join(',')
      this.manyParamsList.forEach((item) => {
        const tempObj = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
        this.addGoodForm.attrs.push(tempObj)
      })
      this.onlyParamsList.forEach((item) => {
        const tempObj = { attr_id: item.attr_id, attr_value: item.attr_vals }
        this.addGoodForm.attrs.push(tempObj)
      })
      const { data: res } = await this.$http.post('goods', this.addGoodForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加失败')
      } else {
        this.$message.success('添加成功')
        this.$router.push('/goods')
      }
    }
  },
  computed: {
    cateId() {
      if (this.selectedKey.length === 3) {
        return this.selectedKey[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.preView {
  width: 100%;
}
.el-button {
  margin-top: 15px;
}
</style>
