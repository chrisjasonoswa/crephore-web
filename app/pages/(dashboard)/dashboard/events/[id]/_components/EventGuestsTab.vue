<script setup lang="ts">
import { Users } from '@lucide/vue'

// The Guests & RSVP tab: the guest list and their replies. Not built yet.
</script>

<template>
  <Empty class="rounded-xl border border-dashed">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Users />
      </EmptyMedia>
      <EmptyTitle>Guests & RSVP</EmptyTitle>
      <EmptyDescription>
        Add your guest list, send invitations and see who's coming. Coming soon.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
