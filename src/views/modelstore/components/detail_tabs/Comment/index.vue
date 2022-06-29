<template>
  <div>
    <v-card v-for="comment in comments" :key="comment.commenttitle" class="mt-3" :comment="comment" flat>
      <v-card-text class="pa-0">
        <v-flex class="kubegems__top-right mt-2">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn color="primary" small text> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text> 回复 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
        <div class="d-flex flex-row comment-row mt-0">
          <div class="comment-text w-100 pa-4 px-6">
            <h3 class="font-weight-regular">{{ comment.username }}</h3>
            <v-rating background-color="orange lighten-3" class="float-right" color="orange" dense small />
            <span class="d-block my-2 text-subtitle-2 font-weight-regular">{{ comment.desc }}</span>
            <div class="comment-footer">
              <span class="text-muted mr-2">{{ comment.date }}</span>
              <div class="float-right">10 回复</div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-card class="kubegems__full-height mt-3" flat min-height="114">
      <div class="kubegems__full-center">
        <v-btn block class="text-h6" color="primary" text>
          <v-icon left>mdi-plus-box</v-icon>
          添加评论
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
  export default {
    name: 'Comment',
    data: () => ({
      comments: [
        {
          img: '/1.jpg',
          activeClass: '',
          username: 'James Anderson',
          desc: 'Lorem Ipsum is simply dummy text of the printing and type setting industry.',
          date: 'April 14, 2016',
          badgebg: 'info',
          status: 'Pending',
        },
        {
          img: '/2.jpg',
          activeClass: 'active',
          username: 'Michael Jorden',
          desc: 'Lorem Ipsum has beenorem Ipsum is simply dummy text of the printing and type setting industry.',
          date: 'April 14, 2016',
          badgebg: 'success',
          status: 'Approved',
        },
        {
          img: '/3.jpg',
          activeClass: '',
          username: 'Johnathan Doeting',
          desc: 'Lorem Ipsum is simply dummy text of the printing and type setting industry.',
          date: 'April 14, 2016',
          badgebg: 'error',
          status: 'Rejected',
        },
        {
          img: '/4.jpg',
          activeClass: '',
          username: 'James Anderson',
          desc: 'Lorem Ipsum is simply dummy text of the printing and type setting industry.',
          date: 'April 14, 2016',
          badgebg: 'info',
          status: 'Pending',
        },
      ],
    }),
  };
</script>
